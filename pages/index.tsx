import { useState, useRef } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Stack, Divider, IconButton, Loader, Animation, Button, InputGroup, Input, DatePicker } from 'rsuite';
import AnimateHeight from 'react-animate-height';
import ModalLoader from '../components/ModalLoader'
const SessionModal = dynamic(() => import('../components/SessionModal'), {
  loading: () => <ModalLoader message="Loading session editor" />
})
const ExportSessionModal = dynamic(() => import('../components/ExportSessionModal'), {
  loading: () => <ModalLoader message="Loading session exporter" />
})
const DeleteSessionModal = dynamic(() => import('../components/DeleteSessionModal'), {
  loading: () => <ModalLoader message="Loading session deleter" />
})
import SessionCard from '../components/SessionCard'
// import SessionModal from '../components/SessionModal'
// import ExportSessionModal from '../components/ExportSessionModal'
// import DeleteSessionModal from '../components/DeleteSessionModal'
import { SessionProps } from '../lib/types'
import { domainUrl, copyToClipboard, json_fetcher, isPresentOrFutureDate, dateToISOString, getStartOfMonthDate, getEndOfMonthDate } from '../lib/utils'
import { Plus, Search } from '@rsuite/icons'
import { MdExpandMore } from 'react-icons/md'
import { GrClose } from 'react-icons/gr'
import hoverStyles from '../styles/hover.module.css'

const sessions_fetcher = json_fetcher('GET');

interface HomePageProps {
  initialSearchText: string,
  initialPageIndex: number
  initialStartDate: string,
  initialEndDate: string,
}

const HomePage: NextPage<HomePageProps> = ({initialSearchText, initialStartDate, initialEndDate, initialPageIndex}) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>(initialSearchText);
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate ? new Date(initialStartDate) : undefined);
  const startDateText = dateToISOString(startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate ? new Date(initialEndDate) : undefined);
  const endDateText = dateToISOString(endDate);
  const [pageIndex, setPageIndex] = useState<number>(initialPageIndex);
  const bottomRef = useRef<HTMLDivElement>(null)

  const updateDateQuery = (start?: Date, end?: Date) => {
    setStartDate(start);
    setEndDate(end);
    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        startDate: dateToISOString(start),
        endDate: dateToISOString(end)
      }
    });
  }

  const { data, isValidating, error, mutate } = useSWR(`/api/get_sessions?page=1&searchText=${searchText}&startDate=${startDateText}&endDate=${endDateText}`, sessions_fetcher);

  const [addSessionShow, setAddSessionShow] = useState<boolean>(false);
  const [editSessionShow, setEditSessionShow] = useState<boolean>(false);
  const [editSessionId, setEditSessionId] = useState<number|undefined>(undefined);
  const [exportSessionShow, setExportSessionShow] = useState<boolean>(false);
  const [exportSessionData, setExportSessionData] = useState<SessionProps|undefined>(undefined);
  const [deleteSessionShow, setDeleteSessionShow] = useState<boolean>(false);
  const [deleteSessionData, setDeleteSessionData] = useState<SessionProps|undefined>(undefined);

  const [addSessionModalLoad, setAddSessionModalLoad] = useState<boolean>(false);
  const [editSessionModalLoad, setEditSessionModalLoad] = useState<boolean>(false);
  const [exportSessionModalLoad, setExportSessionModalLoad] = useState<boolean>(false);
  const [deleteSessionModalLoad, setDeleteSessionModalLoad] = useState<boolean>(false);

  const handleAddSessionClose = () => {
    setAddSessionShow(false);
}
  const handleEditSessionClose = () => {
    setEditSessionShow(false);
  }
  const handleExportSessionClose = () => {
    setExportSessionShow(false);
  }
  const handleDeleteSessionClose = () => {
    setDeleteSessionShow(false);
  }

  const handleSessionMenuSelect = (eventKey?: string, session_data?: SessionProps) => {
    if (session_data) {
        if (eventKey == 'edit') {
            setEditSessionModalLoad(true)
            setEditSessionShow(true)
            setEditSessionId(session_data?.id)
        }
        else if (eventKey == 'share') {
            const url = `https://${domainUrl}/view_session/${session_data.id}`;
            copyToClipboard(url, 'Copied URL to clipboard');
        }
        else if (eventKey == 'export') {
            setExportSessionModalLoad(true)
            setExportSessionShow(true)
            setExportSessionData(session_data)
        }
        else if (eventKey == 'delete') {
            setDeleteSessionModalLoad(true)
            setDeleteSessionShow(true)
            setDeleteSessionData(session_data)
        }
    }
  };

  const GenerateSessionCard = ({session, ...rest}: {session: SessionProps}) => {
    return (
      <SessionCard sessionProps={{
          handleSessionMenuSelect,
          ...session
        }}
        {...rest}
        // onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
        //   if (!['BUTTON', 'svg', 'LI'].includes((event.target as Element).nodeName)) {
        //     router.push(`/view_session/${session.id}`);
        //   }
        //   else {
        //     event.stopPropagation();
        //   }
        // }}
      />
    )
  };

  const PreviousSessions = ({index}: {index: number}) => {
    const { data, isValidating, error } = useSWR(`/api/get_sessions?page=${index}&searchText=${searchText}&startDate=${startDateText}&endDate=${endDateText}`, sessions_fetcher);
    const sessions = data ? data.sessions.map((session: { date: string, songs: string, id: string }) => {
      return {
          ...session,
          date: new Date(session.date),
          songs: session.songs
      }
    }) : [];
    return (
        <Stack wrap direction='row' alignItems='center' justifyContent='center' spacing="2em" >
          {data ? sessions.map((session_data: SessionProps) => <GenerateSessionCard key={session_data.id} session={session_data} />): <></>}
        </Stack>
    )
  }

  const previousSessionPages = [];
  for (let i = 2; i <= pageIndex; i++) {
    previousSessionPages.push(<PreviousSessions index={i} key={i} />)
  }
  
  //const maxItemsPerPage: number = data ? data.maxItemsPerPage : 0;
  const totalPages: number = data ? data.totalPages : 0;
  const processed_data = data ? data.sessions.map((session: { date: string, songs: string, id: string }) => {
      return {
          ...session,
          date: new Date(session.date),
          songs: session.songs
      }
  }) : [];
  const upcoming_sessions = processed_data.filter((session: SessionProps) => isPresentOrFutureDate(session.date));
  const past_sessions = processed_data.filter((session: SessionProps) => !isPresentOrFutureDate(session.date));

  return (
    <>
      {addSessionModalLoad && <SessionModal visibility={addSessionShow} handleClose={handleAddSessionClose} onSuccess={mutate} /> }
      {editSessionModalLoad && <SessionModal editSession={editSessionShow} editSessionId={editSessionId} visibility={editSessionShow} handleClose={handleEditSessionClose} onSuccess={mutate} /> }
      {exportSessionModalLoad && <ExportSessionModal sessionData={exportSessionData} visibility={exportSessionShow} handleClose={handleExportSessionClose} /> }
      {deleteSessionModalLoad && <DeleteSessionModal sessionData={deleteSessionData} visibility={deleteSessionShow} handleClose={handleDeleteSessionClose} onSuccess={mutate} /> }
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' style={{
          width: '100vw'
        }} >
          <Animation.Bounce in={isValidating} >
            <Loader size='md' content="Fetching sessions..." />
          </Animation.Bounce>
          <Stack direction='column' spacing="1em" alignItems='center' justifyContent='center' >
            <Animation.Slide in placement='top' >
              <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                  <IconButton disabled={isValidating} appearance="primary" color="green" icon={<Plus />}
                    onClick={() => {
                      setAddSessionModalLoad(true)
                      setAddSessionShow(true)
                    }} >
                      Add Session
                  </IconButton>
                  <InputGroup>
                    <InputGroup.Addon>
                      <Search />
                    </InputGroup.Addon>
                    <Input value={searchText} onChange={(text)=>{
                        setSearchText(text);
                        setPageIndex(1);
                        router.replace({
                          pathname: router.pathname,
                          query: {
                            ...router.query,
                            searchText: text,
                            pageIndex: 1
                          },
                        });
                      }} placeholder="Search session" />
                    <InputGroup.Button appearance='ghost' onClick={() => {
                          setSearchText('');
                          setPageIndex(1);
                          router.replace({
                              pathname: router.pathname,
                              query: {
                                ...router.query,
                                searchText: '',
                                pageIndex: 1
                              },
                          });
                      }}>
                      <GrClose />
                    </InputGroup.Button>
                  </InputGroup>
                  <Stack wrap direction='row' justifyContent='center' spacing="0em" >
                    <DatePicker value={startDate} isoWeek format="yyyy-MM" placement='bottomStart' ranges={[]}
                      onOk={(date) => {
                        if (date) {
                          let end = endDate;
                          const processed = getStartOfMonthDate(date);
                          if (endDate && processed > endDate) {
                            end = getEndOfMonthDate(date);
                          }
                          updateDateQuery(processed, end);
                        }
                      }}
                      onClean={() => {
                        updateDateQuery(undefined, undefined);
                      }}
                      onClick={(event: React.MouseEvent<Element, MouseEvent>) => event.preventDefault()}
                    />
                    <InputGroup.Addon style={{paddingTop: '1em', paddingBottom: '1em'}} >to</InputGroup.Addon>
                    <DatePicker value={endDate} isoWeek format="yyyy-MM" placement='bottomEnd' ranges={[]}
                      onOk={(date) => {
                        if (date) {
                          let start = startDate;
                          const processed = getEndOfMonthDate(date);
                          if (startDate && processed < startDate) {
                            start = getStartOfMonthDate(date)
                          }
                          updateDateQuery(start, processed);
                        }
                      }}
                      onClean={() => {
                        updateDateQuery(undefined, undefined);
                      }}
                      onClick={(event: React.MouseEvent<Element, MouseEvent>) => event.preventDefault()}
                    />
                  </Stack>
              </Stack>
            </Animation.Slide>
            <h2>Upcoming sessions</h2>
            <Animation.Bounce in={processed_data != undefined} >
              <AnimateHeight
                animateOpacity
                duration={300}
                height={upcoming_sessions && upcoming_sessions.length > 0 ? "auto" : 0}
              >
                <Stack wrap direction='row' alignItems='flex-start' justifyContent='center' spacing="2em" >
                  {upcoming_sessions && upcoming_sessions.map((session: SessionProps) => 
                      <GenerateSessionCard key={session.id} session={session} />
                  )}
                </Stack>
              </AnimateHeight>
            </Animation.Bounce>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h2>Previous sessions</h2>
            <Animation.Bounce in={processed_data != undefined} >
              <AnimateHeight
                animateOpacity
                duration={300}
                height={past_sessions && past_sessions.length > 0 ? "auto" : 0}
              >
              {/* <div style={{
                position: 'relative',
                transition: 'width 2s, height 4s'
              }}> */}
                <Stack wrap direction='row' alignItems='flex-start' justifyContent='center' spacing="2em" >
                  {past_sessions.map((session: SessionProps) =>
                    <GenerateSessionCard key={session.id} session={session} />
                  )}
                  {previousSessionPages.map((page) => page)}
                </Stack>
              {/* </div> */}
               </AnimateHeight>
            </Animation.Bounce> 
            { (pageIndex < totalPages) && 
              <Button className={hoverStyles.hover_grow} appearance="primary" color="violet" onClick={() => {
                setPageIndex(pageIndex + 1);
                router.replace({
                  pathname: router.pathname,
                  query: {
                    ...router.query,
                    pageIndex: pageIndex + 1
                  },
                },  undefined, {scroll: false});
                // setTimeout(() => {
                //   if (bottomRef.current) {
                //     bottomRef.current.scrollIntoView({ behavior: "smooth", block: 'nearest'})
                //   }
                // }, 100)
              }} >
                    <MdExpandMore style={{marginRight: '1em'}} />
                    More
              </Button>
            }
            <div ref={bottomRef}></div>
          </Stack>
        </Stack>
      </main>
    </>
  )
}

HomePage.getInitialProps = async (ctx) => {
  const searchText = ctx.query.searchText as string;
  const startDate = ctx.query.startDate as string;
  const endDate = ctx.query.endDate as string;
  const pageIndex = parseInt(ctx.query.pageIndex as string);

  return {
    initialSearchText: searchText ? searchText : '',
    initialStartDate: startDate ? startDate : '',
    initialEndDate: endDate ? endDate : '',
    initialPageIndex: isNaN(pageIndex) ? 1 : pageIndex
  }
}

export default HomePage
